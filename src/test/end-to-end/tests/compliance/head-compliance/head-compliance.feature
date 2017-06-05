
Feature: Head Compliance Officer Queue Navigation

  Scenario Outline: Review User in HCO Queue
    Given I am the headCompliance
      And there is an user with role <ROLE> created 
    When I login with my account
      And I find the user pending in my queue
      And I click review user button
    Then I go to review user panel

  Scenario Outline: Release User from HCO Queue
    Given I am the headCompliance
      And there is an user with role <ROLE> created 
    When I login with my account
      And I find the user pending in my queue
      And I click review user button
      And I click done button
      And I approve the compliance modal
    Then I am redirected to queue page and I cannot find user

    Examples:
      | ROLE                              |
      | approvedBuyerSentToHco            |
      | notApprovedBuyerSentToHco         |
      | distributorSentToHco              |
