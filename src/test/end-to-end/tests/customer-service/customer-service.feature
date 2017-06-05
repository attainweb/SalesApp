Feature: Customer Service
  Scenario Outline: Edit button is missing
  Given I am the customerService
    And there is an user with role <ROLE> created
  When I login with my account
    And I search for the email <EMAIL> in customer service dashboard
    And I click review user
  Then the edit button is not there

Examples:
  | ROLE                       | EMAIL                               |
  | notApprovedBuyer           | notApproved@company.com                 |
  | notApprovedDistributor     | notApproved-distributor@company.com     |

Scenario Outline: Customer Service can send users to HCO  
    Given I am the customerService
      And there is an user with role <ROLE> created
    When I login with my account  
      And I search for the email <EMAIL> in customer service dashboard
      And I click review user
      And I send the user to HCO
      And I approve the compliance modal
    Then I should see the sent to HCO message

Examples:
    | ROLE                       | EMAIL                               |
    | notApprovedBuyer           | notApproved@company.com                 |
    | notApprovedDistributor     | notApproved-distributor@company.com     |
