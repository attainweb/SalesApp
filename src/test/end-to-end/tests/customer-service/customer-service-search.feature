#
# IMPORTANT: Tests about visibility based on user state should be added
# This tests were added to check email search improvements only 
#

Feature: Customer Service Search

  Scenario: Search for a simple email
    Given I am the customerService
      And there is a PENDING buyer with email email@company.com
      And there is a PENDING buyer with email emailEmail@company.com
    When I login with my account
      And search for email@company.com
    Then  I should see listed user with email email@company.com
      And I should not see listed user with email emailEmail@company.com


  Scenario: Search for an email with dot with an exact match
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe@company.com
    When I login with my account
      And search for johnn.doe@company.com
    Then I should see listed user with email johnn.doe@company.com
  
  Scenario: Search for an email with dot without using the dot
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe@company.com
    When I login with my account
      And search for johnndoe@company.com
    Then I should see listed user with email johnn.doe@company.com
  
  Scenario: Search for an email with alias with exact match
    Given I am the customerService
      And there is a PENDING buyer with email johnndoe@company.com  
      And there is a PENDING buyer with email johnn.doe@company.com
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
    When I login with my account
      And search for johnn.doe+myemail@company.com
    Then  I should see listed user with email johnn.doe+myemail@company.com
      And I should not see listed user with email johnn.doe+b1@company.com
      And I should not see listed user with email johnn.doe@company.com
      And I should not see listed user with email johnndoe@company.com

  Scenario: Search for an email with alias not using alias  (will also match non alias emails)
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
      And there is a PENDING buyer with email johnndoe@company.com  
      And there is a PENDING buyer with email johnn.doe@company.com
    When I login with my account
      And search for johnn.doe@company.com
    Then  I should see listed user with email johnn.doe+myemail@company.com
      And I should see listed user with email johnn.doe+b1@company.com
      And I should see listed user with email johnn.doe@company.com

  Scenario: Search for an email with alias not using alias nor dot (will also match non alias emails)
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
      And there is a PENDING buyer with email johnndoe@company.com  
      And there is a PENDING buyer with email johnn.doe@company.com
    When I login with my account
      And search for johnndoe@company.com
    Then  I should see listed user with email johnn.doe+myemail@company.com
      And I should see listed user with email johnn.doe+b1@company.com
      And I should see listed user with email johnn.doe@company.com
      And I should see listed user with email johnndoe@company.com    

  Scenario: Search for an invalid email with alias
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
    When I login with my account
      And search for johnn.doe+invalid@company.com
    Then  I should not see listed user with email johnn.doe+myemail@company.com
      And I should not see listed user with email johnn.doe+b1@company.com
  
  Scenario: Search for an invalid email not using alias
    Given I am the customerService
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
    When I login with my account
      And search for johnn.invalid@company.com
    Then  I should not see listed user with email johnn.doe+myemail@company.com
      And I should not see listed user with email johnn.doe+b1@company.com

  Scenario: That I won't find anything just by entering 'johnndoe'
    Given I am the customerService
      And there is a PENDING buyer with email johnndoe@company.com  
      And there is a PENDING buyer with email johnn.doe@company.com
      And there is a PENDING buyer with email johnn.doe+myemail@company.com
      And there is a PENDING buyer with email johnn.doe+b1@company.com
    When I login with my account
      And search for johnndoe
    Then  I should not see listed user with email johnn.doe+myemail@company.com
      And I should not see listed user with email johnn.doe+b1@company.com
      And I should not see listed user with email johnn.doe@company.com
      And I should not see listed user with email johnndoe@company.com
