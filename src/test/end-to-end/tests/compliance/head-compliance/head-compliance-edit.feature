Feature: Head Compliance Officer Edit User

  Scenario Outline: HCO should be able to edit <FIELD>
  Given I am the headCompliance
    And there is an user with role approvedBuyerSentToHco created
  When I login with my account
    And I find the user pending in my queue
    And I click review user button
    And I click edit-<FIELD>
    And I enter the <FIELD>
    And I enter my password
    And I submit the <FIELD>
    # This way We can be sure that what's shown on screen is
    # the real value
    And I logout
    And I login with my account
  Then I should see the user's <FIELD> updated
   And A new record in changelog about <FIELD> is created

  Examples:
      |FIELD      |
      |name       |
      |surname    |
      |phone      |
      |birthdate  |

  Scenario Outline: HCO should be able to edit <FIELD>
  Given I am the headCompliance
    And there is an user with role approvedBuyerSentToHco created
  When I login with my account
    And I find the user pending in my queue
    And I click review user button
    And I click edit-<FIELD>
    And I edit the <FIELD> to <SELECT>
    And I enter my password
    And I submit the <FIELD>
    # This way We can be sure that what's shown on screen is
    # the real value
    And I logout
    And I login with my account
  Then I should see the user's <FIELD> updated
    And A new record in changelog about <FIELD> is created

  Examples:
      |FIELD              |SELECT   |
      |status             |PENDING  |
      |language           |ja       |
      |residence-country  |KH       |

  Scenario Outline: HCO should be able to edit <FIELD>
  Given I am the headCompliance
    And there is an user with role approvedBuyerSentToHco created
  When I login with my account
    And I find the user pending in my queue
    And I click review user button
    And I click edit-address
    And I change the <FIELD>
    And I enter my password
    And I submit the <FIELD>
    # This way We can be sure that what's shown on screen is
    # the real value
    And I logout
    And I login with my account
  Then I should see the user's <FIELD> updated
    And A new record in changelog about <FIELD> is created

  Examples:
      |FIELD                    |
      |address                  |
      |zip                      |
      |city                     |
      |state                    |
    
  Scenario: Does a form field validation error show up only for that field
    Given I am the headCompliance
      And there is an user with role approvedBuyerSentToHco created
    When I login with my account
      And I find the user pending in my queue
      And I click review user button
      And I click edit-surname
      And I click edit-name
      And I click update the surname
    Then the validation error count should be 1

Scenario: HCO should not be able to edit if he inputs a wrong password
  Given I am the headCompliance
    And there is an user with role approvedBuyerSentToHco created
  When I login with my account
    And I find the user pending in my queue
    And I click review user button
    And I click edit-name
    And I enter the name
    And I submit a wrong password for field name
  Then the validation error count should be 1

Scenario: HCO edits Distributor status to REJECTED, his refcodes get invalidated
  Given I am the headCompliance
    And there is an user with role distributorSentToHco created
    And user distributorSentToHco has a valid distributor refcode
    And user distributorSentToHco has a valid buyer refcode
  When I login with my account
    And I find the user pending in my queue
    And I click review user button
    And I click edit-status
    And I edit the status to REJECTED
    And I enter my password
    And I submit the status
  Then all refcodes belonging to distributorSentToHco should be expired
