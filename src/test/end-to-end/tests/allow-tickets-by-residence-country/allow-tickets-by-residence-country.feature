Feature: Allow ticket sale by user residence country

Scenario Outline: Approved buyer from JP cannot buy Product when sale is not allowed for JP
Given I am the approvedBuyer
  And I have JP as residence country
  And The sales is started
  And the current tranche is blocking <BLOCKED_REGION> buyers
When I try to reorder 1000 usd worth PRODUCT paying with Btc
Then User approvedBuyer should receive an email with code <EMAIL_CODE>
  And My ticket state should be <TICKET_STATE>

  Examples:

  | BLOCKED_REGION | EMAIL_CODE | TICKET_STATE          |
  | JP             | ET102      | waitingForSaleToStart |
  | KR             | ET203      | invoiceSentBtc        |