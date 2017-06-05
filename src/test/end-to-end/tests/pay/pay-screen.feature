@acceptance 
Feature: Access payment page
  
  Scenario Outline: User should be able to access payment page
    Given I am the approvedBuyer
      And I have a <TYPE> invoice ticket with state invoiceSent<TYPE> and with amount 1000
    When I go to payment page
    Then I shoudld see <TYPE> invoice data

  Examples:
    | TYPE |
    | Btc  |
    | Bank |

