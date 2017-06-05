Feature: Buyer changes email address

  Scenario Outline: User should receive two verification email after pressing the update email button in account
    Given I am the <ROLE>
      And I have invoices with already receipt sent
    When I login with my account
      And I click the change email button
      And I input the new email 'test@test.com'
      And I click the confirm button
    Then User <ROLE> should receive an email in 'test@test.com' with code EU304 containing confirm-email-account
      And My existing email address is not changed
    When I follow the confirmation link
    Then User <ROLE> should receive an email with code EU305 containing confirm-email-change
      And My existing email address is not changed
    When I follow the confirmation link
    Then My email address has changed
      And User <ROLE> should receive an email in 'test@test.com' with code EU306 containing *
      And I should receive an email with code ET301 for each invoice with the new PRODUCT codes
    When I follow the previous confirmation link
    Then I should see invalid ref code message

    Examples:

      | ROLE                   |
      | approvedBuyer          |
      | notApprovedBuyer       |

  Scenario: User receives an error if inputs his own current email
    Given I am the approvedBuyer
    When I login with my account
      And I click the change email button
      And I input my current email for the new email
      And I click the confirm button
    Then I receive an email change error for sameEmail

  Scenario: User receives an error if the email already exists
    Given I am the approvedBuyer
      And there is an user with role notApprovedBuyer created
    When I login with my account
      And I click the change email button
      And I input notApprovedBuyer's email address for the new email
      And I click the confirm button
    Then I receive an email change error for emailAlreadyExists

  Scenario: User inputs and invalid formatted email and gets an error
    Given I am the approvedBuyer
    When I login with my account
      And I click the change email button
      And I input the new email 'test-test.com'
      And I click the confirm button
    Then I receive an email change error for invalidInput

  @integration
  Scenario: Distributor User should not see the the edit button nor be able to edit his email
    Given I am the approvedDistributor
    When I login with my account
    Then I don't see the change email button
      And I get unauthorized error if I execute the meteor call