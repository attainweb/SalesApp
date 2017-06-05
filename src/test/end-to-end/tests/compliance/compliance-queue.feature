Feature: Compliance Officer Queue Navigation

  Scenario Outline: Compliance officer should be able to search
    Given I am the compliance
      And there are 2 users in compliance
    When I login with my account
      And I switch to tab all
      And I search by <FILTER> with a valid <FIELD_NAME>
    Then the user is there

  Examples:
    | FILTER                    | FIELD_NAME           |
    | Surname		                | surname              |
    | Name                      | name                 |
    | Email                     | email                |

  Scenario Outline: Compliance officer should see recently pending users
    Given I am the compliance
      And there is an user with role <USER> created
    When I login with my account
      And I switch to tab recent
    Then the user <USER> is there

  Examples:
    | USER                          |
    | notApprovedDistributor		    |
    | notApprovedBuyer              |
