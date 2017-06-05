Feature: Add Compliance Admin
  As an Admin
  I want to be able to create a compliance admin account
  So that they can login and process new users

  Scenario: Admin adds Compliance Officer
    Given I am the admin
    When I login with my account
      And I navigate to addComplianceOfficer
      And I fill in the form with a valid name, email and password
      And I confirm
    Then Confirmation should be seen
      And New user should be able to login
  
  Scenario Outline: Admin cannot create a Compliance Officer with an existent email
    Given I am the admin
    When I login with my account
      And I navigate to addComplianceOfficer
      And I fill in the form with <USER> email
      And I confirm
    Then error message should be displayed

  Examples:
  |USER                   |
  |approvedBuyer          |
  |notApprovedBuyer       |
  |approvedDistributor    |
  |notApprovedDistributor |
  |headInvoiceManager     |
  |bankManager            |
  |bankChecker            |
  |exporter               |
  |compliance             |
  |chiefcompliance        |
  
  
     
     
     
     
     
     
     
