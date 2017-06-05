Feature: Email test

  Scenario: Send email async
    Given I am the approvedBuyer
    When I send the email with 1000 delay
    Then I should receive it async

  Scenario: Send two emails async and wait for them
    Given I am the approvedBuyer
    When I send the email with 2000 delay
    When I send the email with 1000 delay
    Then I should receive both

  Scenario: Send email sync
    Given I am the approvedBuyer
    When I send the email
    Then I should receive it

  