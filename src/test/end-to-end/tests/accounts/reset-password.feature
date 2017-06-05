Feature: Ask reset password link
  As user I want to be able to ask for a reset password link
  to be sent to my email

  Scenario: View My Account Info
    Given I am the approvedDistributor
    When I navigate to login
     And I click the forgot password button
     And I complete my email
     And Click on Send password reset 
    Then A reset email should only be sent to me