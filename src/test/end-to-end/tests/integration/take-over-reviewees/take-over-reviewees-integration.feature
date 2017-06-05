@integration
Feature: Review officers
  
  Scenario Outline: Take Over Reviewee from Other Officers

    Given I am the <USER>
      And the officer <CURRENT_REVIEWER> is reviewing the user <BUYER>
    When I take over the review process for <BUYER> via the api
    Then I am reviewing the <BUYER>
      And <CURRENT_REVIEWER> is not reviewing the <BUYER> anymore
      
    Examples:
    | USER             |  CURRENT_REVIEWER |  BUYER                     |
    | compliance       |  chiefcompliance  |  notApprovedBuyer          |
    | compliance       |  headCompliance   |  notApprovedBuyer          |
    | headCompliance   |  compliance       |  notApprovedBuyerSentToHco |
    | headCompliance   |  chiefcompliance  |  notApprovedBuyerSentToHco |
    | chiefcompliance  |  compliance       |  notApprovedBuyerSentToCco |
    | chiefcompliance  |  headCompliance   |  notApprovedBuyerSentToCco |
