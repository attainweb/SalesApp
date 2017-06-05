@withoutWorkers
Feature: Recalculate Buyer Compliance Tier on Ticket State changes
  Scenario Outline: Required compliance tier goes back to previous value after expire or cancel overflow ticket
    Given I am the approvedBuyer
      And my complianceLevel is set to 2 
      And I have a Btc invoice ticket with state <STATE> and with amount 80001
      And my status is set to PENDING
      And my applyingForComplianceLevel is set to 3
    When my invoice changes state through <STATE_TRANSITION>
    Then my new required compliance tier is 2
      And I still have compliance level 2
      And my status should be PENDING

    Examples:
      | STATE                | STATE_TRANSITION      |
      | saleStartedBtc       | preCancelInvoice      |
      | invoiceSentBtc       | expireInvoice         |

  Scenario Outline: Required compliance tier scales even if PENDING State is forced to the buyer
    Given I am the approvedBuyer
      And my compliance level is set to 2
      And my status is set to PENDING
      And I have a <PAYMENT_METHOD> invoice ticket with state <STATE> and with amount 80001
    When my invoice changes state through <STATE_TRANSITION>
    Then my new required compliance tier is 3
      And my status should be PENDING

    Examples:
      | PAYMENT_METHOD | STATE           | STATE_TRANSITION          |
      | Btc            | invoiceExpired  | reviveInvoiceBtc          |
      | Bank           | invoiceExpired  | reviveInvoiceBank         |
      | Btc            | receiptSent     | regenerateProductPasscode |
      | Bank           | receiptSent     | regenerateProductPasscode |

  Scenario Outline: User is put into Compliance with new level on ticket overflow
    Given I am the approvedBuyer
    And my compliance level is set to 2
    And I have a Btc invoice ticket with state <STATE> and with amount 80001
    When my invoice changes state through <STATE_TRANSITION>
    Then my new required compliance tier is 3
    And my status should be PENDING

    Examples:
      | STATE           | STATE_TRANSITION          |
      | invoiceExpired  | reviveInvoiceBtc          |
      | receiptSent     | regenerateProductPasscode |
