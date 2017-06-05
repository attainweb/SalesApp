Feature: Login
  As an user
  I want to be able to login
  So that I work with my account

  Scenario Outline: Users with role <ROLE> go to screen <PAGE> after succesful login
    Given I am the <ROLE>
    When I fill login form with my account
    Then I should see the <PAGE> page

    Examples:

    |ROLE                   |PAGE                               |
    |approvedDistributor    |account                            |
    |compliance             |queue                              |
    |chiefcompliance        |queue                              |
    |headCompliance         |queue                              |
    |admin                  |sale-overview                      |
    |headInvoiceManager     |invoiceManager/queue               |
    |bankManager            |invoiceManager/queue               |
    |bankChecker            |invoiceManager/queue               |
    |exporter               |invoiceManager/queue               |
    |sysop                  |sale-overview                      |
    |customerService        |customer-service                   |
    |investigator           |investigator             |

Scenario Outline: User should see contact email address depending on the selected language
    Given I go to login page
    When I select language <LANGUAGE>
    Then I should see contact email address <EMAIL>

  Examples:
  | LANGUAGE  | EMAIL         |
  | EN        | SUPPORT_EMAIL |
  | JA        | SUPPORT_EMAIL |
  | KO        | SUPPORT_EMAIL |
  | ZH        | SUPPORT_EMAIL |
