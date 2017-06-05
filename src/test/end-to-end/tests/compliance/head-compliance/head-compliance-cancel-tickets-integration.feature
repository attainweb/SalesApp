
@integration @withoutWorkers
Feature: Hco invoice tickets cancel
 
  Scenario: HCO can cancel cancellable tickets
    Given I am the headCompliance
      And there are cancellable tickets for approvedBuyerSentToHco
    When I try to cancel approvedBuyerSentToHco tickets
    Then approvedBuyerSentToHco tickets should be cancelled

  Scenario: HCO can't cancel cancellable tickets
    Given I am the headCompliance
      And there are non-cancellable tickets for approvedBuyerSentToHco
    When I try to cancel approvedBuyerSentToHco tickets
    Then approvedBuyerSentToHco tickets should not be cancelled