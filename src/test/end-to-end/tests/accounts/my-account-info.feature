Feature: My Account Info
  As a Buyer or Distributor
  I want to be able to view My Account Info
  So that I can verify it is correct

  Scenario Outline: View My Account Info
    Given I am the <ROLE>
    When I login with my account  
      And I navigate to account
    Then I should see the account info panel
      And I should see my name
      And I should see my email
      And I should see my status

    Examples:
      | ROLE                      |
      | approvedDistributor       |
      | notApprovedDistributor    |
      | approvedBuyer             |
      | notApprovedBuyer          |

Scenario: I should see a link to blockchain.info on my dashboard
    Given I am the approvedDistributor
    When I login with my account
    Then I should see a link to blockchain.info with my wallet-address