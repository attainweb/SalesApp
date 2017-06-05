Feature: Review officers

  Scenario Outline: Compliance officer can review the same user 
   that the customer service officer is reviewing
    
    Given I am the <ROLE>
     And the officer <CURRENT_REVIEWER> is reviewing the user <BUYER>
    When I login with my account
     And I find the user pending in my queue
     And I click review user button
    Then I go to review user panel

    Examples:
    | ROLE                |  CURRENT_REVIEWER |  BUYER                     |
    | compliance          |  customerService  |  notApprovedBuyer          |
    | headCompliance      |  customerService  |  notApprovedBuyerSentToHco |
    | chiefcompliance     |  customerService  |  notApprovedBuyerSentToCco |

  Scenario Outline: Compliance officer doesnt see customer service reviewer name
   that the customer service officer is reviewing

    Given I am the <ROLE>
     And the officer <CURRENT_REVIEWER> is reviewing the user <BUYER>
    When I login with my account
     And I find the user pending in my queue
    Then the reviewer name is empty

    Examples:
    | ROLE                |  CURRENT_REVIEWER |  BUYER                     |
    | compliance          |  customerService  |  notApprovedBuyer          |
    | headCompliance      |  customerService  |  notApprovedBuyerSentToHco |
    | chiefcompliance     |  customerService  |  notApprovedBuyerSentToCco |

Scenario Outline: Customer service officer can review the same user 
   that the compliance officer is reviewing
    
    Given I am the <ROLE>
     And the officer <CURRENT_REVIEWER> is reviewing the user <BUYER>
    When I login with my account
     And I search for the email <BUYER_EMAIL> in customer service dashboard
     And I click review user button
    Then I go to review user panel

    Examples:
    | ROLE                |  CURRENT_REVIEWER |  BUYER                      |  BUYER_EMAIL                       |
    | customerService     |  compliance       |  notApprovedBuyer           |  notApproved@company.com               | 
    | customerService     |  headCompliance   |  notApprovedBuyerSentToHco  |  notApprovedBuyerSentToHco@company.com |
    | customerService     |  chiefcompliance  |  notApprovedBuyerSentToCco  |  notApprovedBuyerSentToCco@company.com |

Scenario Outline: Show Take Over Reviewee Modal
    
    Given I am the <ROLE>
      And the officer <CURRENT_REVIEWER> is reviewing the user <BUYER>
    When I login with my account
      And I find the user pending in my queue
      And I see the current reviewer name
      And I click review user button
      And I see the take over reviewee modal
      And I cancel the modal
    Then I am not reviewing the user

    Examples:
    | ROLE             |  CURRENT_REVIEWER |  BUYER                     | 
    | compliance       |  headCompliance   |  notApprovedBuyer          |
    | compliance       |  chiefcompliance  |  notApprovedBuyer          |
    | headCompliance   |  compliance       |  notApprovedBuyerSentToHco |
    | headCompliance   |  chiefcompliance  |  notApprovedBuyerSentToHco |
    | chiefcompliance  |  compliance       |  notApprovedBuyerSentToCco |
    | chiefcompliance  |  headCompliance   |  notApprovedBuyerSentToCco |
    
Scenario: Take Over Reviewee from Other Officer
  # All other combinations are tested by an API integration test
  Given I am the compliance
    And the officer headCompliance is reviewing the user notApprovedBuyer
  When I login with my account
    And I click review user button
    And I approve the modal
  Then I go to review user panel
    And headCompliance is not reviewing the notApprovedBuyer anymore
