Feature: Payment status is shown correctly in buyers panel

  Scenario Outline: Tickets in <STATE> states show paymentState "<STATE>"
    Given I am the approvedDistributor
      And there is an user with role approvedBuyer created with approvedDistributor as originator
      And there are tickets in <STATE> states for user approvedBuyer
    When I login with my account
      And I navigate to buyers
      And I click the open all tabs button
    Then All tickets should show paymentState <STATE>

Examples:
  | STATE     |
  | paid      |
  | unpaid    |
  | cancelled |
