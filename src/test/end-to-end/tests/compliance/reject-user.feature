@withoutWorkers @end-to-end
Feature: Cancel Existing Tickets when Buyer is Rejected

  Scenario Outline: Tickets in cancellable tickets are Cancelled
    Given I am the <OFFICER>
      And I login with my account
      And there is an user with role notApprovedBuyer created
      And there are cancellable tickets for notApprovedBuyer
      And I review the notApprovedBuyer
    When I click reject button
      And I approve the compliance modal
    Then notApprovedBuyer tickets should be cancelled

  Examples:
    | OFFICER            |
    | compliance         |
    | chiefcompliance    |
    
  Scenario Outline: Tickets in non cancellable states are not Cancelled
    Given I am the <OFFICER>
      And I login with my account
      And there is an user with role notApprovedBuyer created
      And there are non-cancellable tickets for notApprovedBuyer
      And I review the notApprovedBuyer
    When I click reject button
      And I approve the compliance modal
    Then notApprovedBuyer tickets should not be cancelled

  Examples:
    | OFFICER            |
    | compliance         |
    | chiefcompliance    |

@integration
  Scenario: Tickets in cancellable tickets are Cancelled when an HCO rejects an user
    Given I am the headCompliance
      And I login with my account
      And there is an user with role notApprovedBuyer created
      And there are cancellable tickets for notApprovedBuyer
    When I reject the user notApprovedBuyer with edit method
    Then notApprovedBuyer tickets should be cancelled
