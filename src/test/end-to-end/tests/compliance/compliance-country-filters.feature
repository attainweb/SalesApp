Feature: Compliance Country Filters

  Background:
    Given I am the compliance
     And there are 2 users in compliance with country of residence Japan
     And there are 2 users in compliance with country of residence Korea
     And there are 2 users in compliance with country of residence China
     And sales are allowed in Japan, Korea, China

  Scenario: All countries are selected by default
    When I login with my account
    Then I see all users with theirs country of residence

  Scenario: Deselect a Country from the Filter
    When I login with my account
     And I deselect Korea option from the country filter
    Then I should only see Japan and China users listed

  Scenario: Only Showing Other Countries
   When I login with my account
     And I deselect Korea option from the country filter
     And I deselect Japan option from the country filter
   Then I should only see China users listed
