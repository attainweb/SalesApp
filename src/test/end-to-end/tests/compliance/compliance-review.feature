Feature: Compliance officers user review
  All compliance officers should be able to review
  users and approve or reject them
  by any other officer in the past.

  Scenario Outline: Officer Review and Approves Buyer
    Given I am the <OFFICER>
      And I login with my account
      And there is an user with role notApprovedBuyer created
      And I review the notApprovedBuyer
    When I click approve button
      And I approve the compliance modal
    Then I am redirected to queue page and I cannot find user
      And notApprovedBuyer should receive the approval email with code EU201

  Examples:
    | OFFICER            |
    | compliance         |
    | chiefcompliance    |

  Scenario Outline: Officer Review and Approves Distributor
    Given I am the <OFFICER>
      And I login with my account
      And there is an user with role notApprovedDistributor created
      And User notApprovedDistributor has a refcode with type signup
      And I review the notApprovedDistributor
    When I click approve button
      And I approve the compliance modal
    Then I am redirected to queue page and I cannot find user
      And notApprovedDistributor should receive the approval email with code EU202

  Examples:
    | OFFICER            |
    | compliance         |
    | chiefcompliance    |
