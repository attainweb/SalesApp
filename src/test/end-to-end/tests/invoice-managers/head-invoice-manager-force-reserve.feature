@withoutWorkers
Feature: Force reserve PRODUCT
  The HIM should be able to force a ticket in states btcAddressAssigned
  or waitingForSaleToStart and "No PRODUCT reserved" to sale started

  Scenario Outline: Force a ticket into having reserved Product
    Given I am the headInvoiceManager
      And I login with my account
      And I switch to tab forceReserve
    When there is a <TICKET_TYPE> ticket with "No PRODUCT reserved" (<STATE>)
      And I click "Force reserve PRODUCT"
      And I confirm the modal
    Then the ticket state should be changed to have reserved PRODUCT
      And the ticket should be included in current tranche
      And the tab counters must be updated

    Examples:
      | TICKET_TYPE   |  STATE                    |
      | Btc           |  btcAddressAssigned       |
      | Btc           |  waitingForSaleToStart    |
      | Bank          |  btcAddressAssigned       |
      | Bank          |  waitingForSaleToStart    |
