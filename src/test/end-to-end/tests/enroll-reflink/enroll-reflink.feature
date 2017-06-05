Feature: Distributor creates and sees his reflinks listed 

Scenario Outline: Distributor creates and sees his reflinks listed
  Given I am the <USER>
  When I login with my account
    And I navigate to <PAGE>
    And I click Generate Link button
  Then I should see the link generated
  When I navigate to <VIEW_PAGE>
  Then I should see the refcode listed

Examples:
  | USER                  | PAGE        | VIEW_PAGE |
  | approvedDistributor   | distref     | viewlinks |
  | approvedDistributor   | buyerref    | viewlinks |
  | admin                 | partnerlink | viewpartnerlinks |