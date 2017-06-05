Feature: Re generate PRODUCT passcodes
  
  Scenario Outline: As a buyer I can regenerate my PRODUCT codes
    Given I am the <ROLE>
      And I have invoices with already receipt sent
    When I login with my account
      And I navigate to purchases
      And I click Regenerate PRODUCT codes
      And I confirm the Regenerate Modal
      And I receive an email with confirmation link to regenerate PRODUCT codes
      And I follow the confirmation link
    Then I should see a message saying that all my passcodes were regenerated successfully
      And I should receive an email with code ET301 for each invoice with the new PRODUCT codes

  Examples:

  | ROLE                   |
  | approvedBuyer          |
  | notApprovedBuyer       | 