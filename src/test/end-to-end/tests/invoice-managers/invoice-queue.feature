Feature: Head Invoice Manager Queue Navigation
Scenario Outline: BankManager and HIM can add ticket to bundles
  Given I am the <ROLE>
    And there is a invoice Bank ticket with state invoiceSentBank and with status PENDING created
  When I login with my account
    And I switch to tab unpaidInvoices
    And I expand the card of the ticket
    And I set 5 YEN as funds received
    And I choose 1 as bank
    And I click funds received
    And I confirm funds
    And I switch to tab sentToBankChecker
  Then the ticket is there

  Examples:
    | ROLE                      |
    | bankManager               |
    | headInvoiceManager        |

Scenario: BankChecker confirms payment
  Given I am the bankChecker
    And there is a invoice Bank ticket with state fundsReceived and with status PENDING created
  When I login with my account
    And I switch to tab confirmBankAmount
    And I expand the card of the ticket
    And I confirm Payment
  Then User notApprovedBuyer should receive an email with code ET205

Scenario Outline: Invoice manager should be able to search
  Given I am the headInvoiceManager
    And there is a invoice Bank ticket with state invoiceSentBank and with status PENDING created
  When I login with my account
    And I switch to tab unpaidInvoices
    And I search for the invoice with a valid <FIELD_NAME> value
  Then the ticket is there

  Examples:
    | FIELD_NAME           |
    | invoiceNumber        |
    | buyerId              |
    | invoiceTransactionId |
    | payoutTransactionId  |
    | btcAddress           |
    | bank                 |

Scenario Outline: Expired Tickets does not have options
  Given I am the <INVOICE_MANAGER>
    And there is an expired ticket
  When I login with my account
    And I switch to tab expired
  Then the ticket should not have a toggle button  
  
  Examples:
    | INVOICE_MANAGER    |
    | headInvoiceManager |
    | bankManager        |

Scenario: HIM approves invalid funds received ticket
  Given I am the headInvoiceManager
    And there is a invoice Btc ticket with state invalidFundsReceived and with status PENDING created
  When I login with my account
    And I switch to tab invalidFundsReceived
    And I expand the card of the ticket
    And I click the Approve Invalid Ticket button
    And I confirm the modal
  Then the ticket is in state invalidTicketApproved

Scenario: HIM set invalid funds received ticket as Refunded
  Given I am the headInvoiceManager
    And there is a invoice Btc ticket with state invalidFundsReceived and with status PENDING created
  When I login with my account
    And I switch to tab invalidFundsReceived
    And I expand the card of the ticket
    And I click the "Set as Refunded" button
    And I fill the refundReason field in the popup
    And I fill the refundTransactionId field in the popup
    And I confirm the refund modal
  Then the ticket is in state invalidFundsRefunded
  
Scenario: HIM set invalid funds received ticket as Refunded but doesn't fulfill reason, so he gets an error
  Given I am the headInvoiceManager
    And there is a invoice Btc ticket with state invalidFundsReceived and with status PENDING created
  When I login with my account
    And I switch to tab invalidFundsReceived
    And I expand the card of the ticket
    And I click the "Set as Refunded" button
    And I fill the refundTransactionId field in the popup
    And I confirm the refund modal
  Then I get an error indicating I need to set a reason

Scenario: HIM set invalid funds received ticket as Refunded but doesn't fulfill transaction Id, so he gets an error
  Given I am the headInvoiceManager
    And there is a invoice Btc ticket with state invalidFundsReceived and with status PENDING created
  When I login with my account
    And I switch to tab invalidFundsReceived
    And I expand the card of the ticket
    And I click the "Set as Refunded" button
    And I fill the refundReason field in the popup
    And I confirm the refund modal
  Then I get an error indicating I need to set a valid bitcoin transaction id

@integration
Scenario Outline:  Only HIM can change the invalid funds received ticket state
  Given I am the <ROLE>
    And there is a invoice Btc ticket with state invalidFundsReceived and with status PENDING created
  When I login with my account
    And I try to call the change state functions for an invalid funds received ticket to <NEW_STATE>
  Then I'm denied with unauthorized error

Examples:
 | ROLE                | NEW_STATE             |
 | admin               | invalidTicketApproved |
 | approvedDistributor | invalidTicketApproved |
 | headInvoiceManager  | invalidTicketApproved |
 | bankManager         | invalidTicketApproved |
 | bankChecker         | invalidTicketApproved |
 | exporter            | invalidTicketApproved |
 | customerService     | invalidTicketApproved |
 | compliance          | invalidTicketApproved |
 | chiefcompliance     | invalidTicketApproved |
 | headCompliance      | invalidTicketApproved |
 | approvedBuyer       | invalidTicketApproved |