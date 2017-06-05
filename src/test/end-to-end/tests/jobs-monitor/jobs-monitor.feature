@end-to-end
Feature: The sysop monitors the jobs execution status

  Scenario: Sysop can see jobs status
    Given I am the sysop
    When I login with my account
      And I navigate to jobs-monitor
    Then I can see the current jobs

  @integration @withoutWorkers
  Scenario: If a job has been running for more than an hour, it should be displayed as stalled
    Given I am the sysop
      And there is a job in running state started an hour ago
    When I login with my account
      And I navigate to jobs-monitor
    Then I can see the job with status 'stalled' in red