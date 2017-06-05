Feature: Purchases
  
  Scenario: As a buyer I can view my tickets
    Given I am the approvedBuyer
      And I have a Btc invoice ticket with state receiptSent and with amount 1000
    When I login with my account
      And I navigate to purchases
    Then I should see the Purchases list
  