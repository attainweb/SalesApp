Feature: HCO changes user's underInvestigation state

Scenario Outline: HCO adds state underInvestigation to user
    Given I am the headCompliance
      And I login with my account
      And there is an user with role distributorSentToHco created
      And User distributorSentToHco has a refcode with type <REFTYPE>
      And I click review user button
      And I click edit-under-investigation
      And I add the status underInvestigation
      And I enter my password
      And I submit the isUnderInvestigation
    Then I should see that the user's under investigation status has changed
      And I should not be able to go to distributorSentToHco links

  Examples:

  | REFTYPE             |
  | buyer               |
  | distributor         |
  | confirmAddress      |
  | confirmEmailAccount |
  | confirmEmailChange  |
  | re-generate-all     |

Scenario Outline: HCO removes state underInvestigation
   Given I am the headCompliance
      And I login with my account
      And there is an user with role distributorUnderInvestigation created
      And User distributorUnderInvestigation has a refcode with type <REFTYPE>
      And I click review user button
      And I click edit-under-investigation
      And I remove the status underInvestigation
      And I enter my password
      And I submit the isUnderInvestigation
    Then I should see that the user's under investigation status has changed
      And I should be able to go to distributorUnderInvestigation links

  Examples:

  | REFTYPE             |
  | buyer               |
  | distributor         |
  | confirmAddress      |
  | confirmEmailAccount |
  | confirmEmailChange  |
  | re-generate-all     |