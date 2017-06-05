Feature: Options for Purchases' Tickets

  Scenario: As a buyer I can re-generate one of my Invoice Tickets in receiptSent
    Given I am the approvedBuyer
      And I have a Btc invoice ticket with state receiptSent and with amount 1000
    When I login with my account
      And I navigate to purchases
      And I click "Regenerate PRODUCT Code"
      And I confirm the Regenerate Modal
    Then User approvedBuyer should receive an email with code EU502 containing re-generate-product-passcode
      And I follow the confirmation link
    Then I should see a message saying that my passcode were regenerated successfully
      And User approvedBuyer should receive an email with code ET301 containing TEST_NEW_PRODUCT_PASSCODE
    When I login with my account
      And I navigate to purchases
    Then Ticket should have increased the generation counter by one
    
  @integration
  Scenario Outline: As a User I cannot re-generate other's buyer's ticket
    Given I am the <USER>
     And notApprovedBuyer has a Btc invoice ticket with state receiptSent and with amount 1000
    When I login with my account
     And I try to execute the meteor call to re-generate other's buyer's ticket
    Then I'm denied with unauthorized error
  
    Examples:
      |USER                   |
      |approvedBuyer          |
      |approvedDistributor    |
      |compliance             |
      |chiefcompliance        |
      |headCompliance         |
      |admin                  |
      |headInvoiceManager     |
      |bankManager            |
      |bankChecker            |
      |exporter               |
      |sysop                  |   
