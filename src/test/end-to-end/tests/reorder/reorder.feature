Feature: Reorder

  Scenario Outline: Approved Buyer tries to Reorder
    Given The sales is <SALES_STATUS>
      And I am the approvedBuyer
    When I try to reorder 1000 usd worth PRODUCT paying with <PAYMENT_METHOD>
    Then I should see a thank you message
      And User approvedBuyer should receive an email with code <EMAIL_CODE>

    Examples:
      | SALES_STATUS   | PAYMENT_METHOD | EMAIL_CODE |
      | started        | Btc            | ET203      |
      | started        | Bank           | ET202      |
      | stopped        | Btc            | ET102      |
      | stopped        | Bank           | ET102      |

  Scenario Outline: Approved Buyer tries to Reorder but sales goal has been reached
    Given I am the approvedBuyer
      And the sales goal has been reached
    When I try to reorder 1000 usd worth PRODUCT paying with <PAYMENT_METHOD>
      Then I should see a thank you message
      And User approvedBuyer should receive an email with code ET102

    Examples:
      | PAYMENT_METHOD |
      | Btc            |
      | Bank           |

  Scenario: Approved Buyer tries to Reorder there is no Product available but the sales goal is not yet reached
    Given I am the approvedBuyerWithHighestComplianceLevel
      And there is no more PRODUCT available but sales is not reached
    When I try to reorder 1000 usd worth PRODUCT paying with Btc
    Then I should see a thank you message
     And User approvedBuyerWithHighestComplianceLevel should receive an email with code ET101

  Scenario: Approved Buyer tries to Reorder there is no Product available but the sales goal is not yet reached
    Given I am the approvedBuyerWithHighestComplianceLevel
      And there is no more PRODUCT available but sales is not reached
    When I try to reorder 1000 usd worth PRODUCT paying with Btc
    Then I should see a thank you message
     And I should receive a mail saying my reorder ticket is in the waiting queue

  Scenario: Pending Buyer tries to Reorder
    Given I am the notApprovedBuyer
    When I try to reorder 1000 usd worth PRODUCT paying with Btc
    Then I should see an error regarding to my approval state

  Scenario: Unknow user tries to Reorder
    Given I am unKnow user with email: unknowUser@atixlabs.com
    When I try to reorder
    Then I should see an error regarding to unregistered state

  Scenario: A buyer reorder while there is no Product available but the sales goal is not yet reached
    Given I am the approvedBuyer
      And there is no more PRODUCT available but sales is not reached
    When I try to reorder 2000 usd worth PRODUCT paying with Btc
    Then I should see a thank you message
     And I should receive a mail saying my reorder ticket is in the waiting queue

  Scenario Outline: Logged in Buyer tries to Reorder
   Given The sales is <SALES_STATUS>
     And I am the approvedBuyer
   When I login with my account
     And I try to reorder 1000 usd worth PRODUCT paying with <PAYMENT_METHOD> while logged in as buyer
   Then I should see a thank you message
     And User approvedBuyer should receive an email with code <EMAIL_CODE>

   Examples:
     | SALES_STATUS   | PAYMENT_METHOD | EMAIL_CODE |
     | started        | Btc            | ET203      |
     | started        | Bank           | ET202      |
     | stopped        | Btc            | ET102      |
     | stopped        | Bank           | ET102      |
