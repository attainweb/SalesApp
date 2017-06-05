@end-to-end
Feature: Head Compliance Officer Canceling Tickets

  Scenario: HCO can cancel invoice tickets with saleStartedBtc
    Given I am the headCompliance
      And there is an user with role approvedBuyerSentToHco created
      And there is a Btc ticket with saleStartedBtc created for user approvedBuyerSentToHco
    When I login with my account
     And I click review user button
     And I click Cancel Ticket
     And I confirm the modal
    Then the ticket state should be changed canceled
     And User approvedBuyerSentToHco should receive an email with code ET206

  Scenario: HCO cannot cancel invoice tickets with fundsReceivedConfirmed
    Given I am the headCompliance
      And there is an user with role approvedBuyerSentToHco created
      And there is a Btc ticket with fundsReceivedConfirmed created for user approvedBuyerSentToHco
    When I login with my account
      And I click review user button
    Then the ticket should not have a toggle button

#Note: This is only an end-to-end test with a single state. The rest of the states are set in an integration test
