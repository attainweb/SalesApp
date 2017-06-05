@integration
Feature: Product Passcode Generation
  When user pays for an invoice PRODUCT passcode should be generated and 
  sent to him so he can claim for PRODUCT he bought

  Scenario: Buyer Pays Ticket and Product Passcodes are Sent
    Given I am the approvedBuyer
    When I pay my ticket
    Then I get an ET301 email with the Product passcode in plain text
    And COMPANY receives an ET301 email with masked hashed Product passcode
    And my plain text Product passcode is not stored in the database but the SHA256 is
    And my productPasscodeHash is logged in the changelog
