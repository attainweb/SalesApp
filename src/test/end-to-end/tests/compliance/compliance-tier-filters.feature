Feature: Compliance Country Filters

  Background:
    Given I am the compliance
     And there are users in compliance with every compliance level
     #This is to be sure tests will always work, since buyers are created with country = Japan
     And sales are allowed in Japan 
     

  Scenario: All tiers are selected by default
    When I login with my account
    Then I see all the users in the queue

  Scenario Outline: Deselect a Tier from the Filter
    When I login with my account
     And I deselect <TIER> option from the tier filter
    Then I should not see the users applying for tier <TIER>
  
  Examples:
  | TIER |
  | a    |
  | b    |
  | c    |
  | 'd+' |
