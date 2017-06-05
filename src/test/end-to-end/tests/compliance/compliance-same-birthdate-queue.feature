@end-to-end @withoutWorkers
Feature: Show users with duplicate birthdays
  When a compliance officer is reviewing a user, he should be able to a see a list of users with same birthday as reviewee in order to find out duplicate users
  
Scenario Outline: Compliance officer is reviewing a user and there are other users with the same birthday those should be shown

  Given I am the compliance
    And I review the <USER>
    And there is an user with the same birthday as <USER>
  When I login with my account
    And I go to review user panel
    And I see a list of users with the same birthday
    And I click expand button
  Then I should see matching birthdays
    And I should see the same fields shown for the reviewee to compare the data

  Examples:
    | USER                    |
    | notApprovedBuyer        |
    | notApprovedDistributor  |
    | notApprovedPartner      |

Scenario: Compliance officer is reviewing a user and there are no other users with the same birthday

  Given I am the compliance
    And I review the notApprovedBuyer
    And there is an user with a different birthday than notApprovedBuyer
  When I login with my account
    And I go to review user panel
  Then I should see an empty list of users with the same birthday

Scenario Outline: Only buyers and distributors should be seen

  Given I am the compliance
    And I review the notApprovedBuyer
    And there is a user with role <ROLE> with the same birthday as notApprovedBuyer
  When I login with my account
    And I go to review user panel
  Then I should see an empty list of users with the same birthday

  Examples:
    | ROLE                  |
    | compliance            |
    | chiefcompliance       |
    | headCompliance        |
    | admin                 |
    | headInvoiceManager    |
    | bankManager           |
    | bankChecker           |
    | exporter              |

Scenario Outline: Any user besides Compliance should not see birthday matching users

  Given I am the <ROLE>
    And I review the notApprovedBuyer
    And there is an user with the same birthday as notApprovedBuyer
  When I login with my account
    And I go to review user panel
  Then I should not see the users with same birthday list

  Examples:
  | ROLE            |
  | headCompliance  |
  | customerService |
  | chiefcompliance |
