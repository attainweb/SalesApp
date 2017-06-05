Feature: Change Wallet Address

  Scenario Outline: User should receive an verification email after pressing the update wallet address button in personalInformation info
    Given I am the <ROLE>
    When I fill login form with my account
      And I move to the account page
      And I click the update wallet address button
      And I input the new wallet address 'n35VpyoySeCTi2yDV93s2dZMYboeHu5xn3'
      And I click the confirm button
    Then User <ROLE> should receive an email with code EU302 containing confirm-address-change
      And My existing wallet address is not changed
    When I follow the confirmation link
    Then I receive the confirmation email
      And My wallet address has changed
    When I follow the previous confirmation link
    Then I should see invalid ref code message

    Examples:

    |ROLE                   |
    |approvedDistributor    |
    |notApprovedDistributor |
  
  Scenario Outline: If I enter an invalid address, I should see an error message
    Given I am the approvedDistributor
    When I fill login form with my account
      And I move to the account page
      And I click the update wallet address button
      And I input the new wallet address '<ADDRESS>'
      And I click the confirm button
    Then I receive an error message with code <EXPECTED_CODE>

      Examples:

      | ADDRESS         | EXPECTED_CODE        |
      | invalidAddress  | invalidWalletAddress |
      | sameAddress     | sameAddress          |

  Scenario: User change the address for a second time, before confirming the first one, if he enters the first link, it's invalid
    Given I am the approvedDistributor
    When I fill login form with my account
      And I move to the account page
      And I click the update wallet address button
      And I input the new wallet address 'n35VpyoySeCTi2yDV93s2dZMYboeHu5xn3'
      And I click the confirm button
    Then I should see the success message
      And User approvedDistributor should receive an email with code EU302 containing confirm-address-change
      And My existing wallet address is not changed
      And I click the update wallet address button
      And I input the new wallet address 'mss5NFyX96ix4erFMamR1gK3SsvUSMWcjE'
      And I click the confirm button
    When I follow the confirmation link
      Then I should see invalid ref code message
