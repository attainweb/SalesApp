Feature: Enroll
  
  Scenario Outline: A new user enrolls correctly
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I finish completing contact information for <ROLE>
      And I finish selecting agreements for <ROLE>
      And I check that I have not uploaded forbidden documents
      And I skip upload documents
    Then I should see a thank you message for enrolling as <ROLE>

    Examples:
      | ROLE            |
      | buyer           |
      | distributor     |
  
  Scenario Outline: A new user cannot enroll if contact information is missing
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I don't complete contact-information
    Then I should see error messages regarding to missing contact information for <ROLE>

    Examples:
      | ROLE            |
      | buyer           |
      | distributor     |

  Scenario: A new buyer cannot enroll if Product amount is negative
    Given There is a buyer enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I complete contact-information with negative Product
    Then I should see an error message regarding to invalid Product amount

  Scenario Outline: A new user cannot enroll without agree with terms and conditions
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
      And I finish completing residence selection
      And I finish completing contact information for <ROLE>
    When I skip agreements <AGREEMENTS>
     And I click next
    Then I should see error messages regarding for required agreements
 
    Examples:
      | ROLE            | AGREEMENTS            |
      | buyer           | acceptToc, acceptRisk |
      | distributor     | acceptToc             |

  Scenario: A new user cannot enroll without agreeing to the privacy policy
    Given There is a buyer enroll link created
      And I go to enroll screen
      And I finish completing residence selection
      And I complete contact information for buyer without checking policies
    When I skip agreements acceptPolicy
      And I click next
    Then I should see error messages regarding missing Privacy Policy 

  Scenario Outline: A new user cannot enroll without validating the zip code
    Given There is a buyer enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I complete contact-information without zip code validation for <ROLE>
    Then I should see an error message regarding missing zip code validation

    Examples:
      | ROLE            |
      | buyer           |

  Scenario Outline: Two new users cannot enroll with same refcode if refcode type is onetime
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I finish completing contact information for <ROLE>
      And I finish selecting agreements for <ROLE>
      And I check that I have not uploaded forbidden documents
      And I I skip upload documents
      And I go to enroll screen
    Then I should see invalid ref code message

    Examples:
      | ROLE            |
      | buyer           |
      | distributor     |

  Scenario Outline: A non Japanese buyer cannot enroll with payment method 'bank'
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection with a non Japanese country
    Then I should not see a payment method drop down on the contact information screen

    Examples:
      | ROLE            |
      | buyer           |

  Scenario Outline: A buyer must purchase a minimum Product amount determined by country
    Given There is a buyer enroll link created
      And I go to enroll screen
    When I complete residence selection with country <COUNTRY>
      And I enter an productAmount of less than <AMOUNT> on the contact information screen
    Then I should see an error message for min Product Amount <AMOUNT>

    Examples:
      | AMOUNT |   COUNTRY   |
      | 1000   |     JP      |
      | 500    |     KH      |
      | 1000   |     CN      |
      | 1000   |     HK      |
      | 500    |     KR      |
      | 500    |     MY      |
      | 500    |     PH      |
      | 1000   |     SG      |
      | 500    |     TW      |
      | 500    |     TH      |
      | 500    |     VN      |

  Scenario Outline: A new buyer user enrolls correctly
    Given The sales is <SALES_STATUS>
      And there is an user with role approvedDistributor created
      And There is a buyer enroll link created with approvedDistributor as originator
      And I go to enroll screen
    When I finish completing residence selection
      And I finish completing contact information for buyer
      And I finish selecting agreements for buyer
      And I check that I have not uploaded forbidden documents
      And I skip upload documents
    Then I should see a thank you message for enrolling as buyer
      And I should receive the following emails: <EMAIL_CODE>

    Examples:
    | SALES_STATUS  | EMAIL_CODE |
    | started       | ET201      |
    | stopped       | ET102      |

  Scenario: A new buyer user enrolls correctly but sales goal has been reached
    Given there is an user with role approvedDistributor created
      And the sales goal has been reached
      And There is a buyer enroll link created with approvedDistributor as originator
      And I go to enroll screen
    When I finish completing residence selection
      And I finish completing contact information for buyer
      And I finish selecting agreements for buyer
      And I check that I have not uploaded forbidden documents
      And I skip upload documents
    Then I should see a thank you message for enrolling as buyer
      And I should receive the following emails: ET102

  Scenario: A new buyer enrolls there is no Product available but the sales goal is not yet reached
    Given There is a buyer enroll link created
      And there is no more PRODUCT available but sales is not reached
      And I go to enroll screen
    When I complete residence selection with country JP
     And I finish completing contact information for buyer for an amount of 2000 with Btc
     And I finish selecting agreements for buyer
     And I check that I have not uploaded forbidden documents
     And I skip upload documents
    Then I should see a thank you message for enrolling as buyer
      And I should receive the following emails: ET101, EU102

  Scenario: A distributor enrolls correctly
    Given There is a distributor enroll link created
      And I go to enroll screen
    When I finish completing residence selection
    Then I see the state field on contact information step
      And I complete contact information for distributor with email test@company.com
      And I finish selecting agreements for distributor
      And I check that I have not uploaded forbidden documents
      And I skip upload documents
    Then I should see a thank you message for enrolling as distributor
      And The email EU301 should be sent only to me

  Scenario Outline: When a Korean buyer user enrolls, he does not see the state field and that get auto-set to 'KR'
    Given There is a <USER_ROLE> enroll link created
      And I go to enroll screen
    When I complete residence selection with country KR
    Then I don't see the state field on contact information step
    When I finish completing contact information for <USER_ROLE>
      And I finish selecting agreements for <USER_ROLE>
      And I skip upload documents
    Then I should see a thank you message for enrolling as <USER_ROLE>
      And I have State set as 'KR'

    Examples:
      | USER_ROLE     |
      | buyer         |
      | distributor   |

  Scenario Outline: Only certain countries should be warned about forbidden documents to be uploaded
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I complete residence selection with country <COUNTRY>
      And I finish completing contact information for <ROLE>
      And I finish selecting agreements for <ROLE>
    Then I should <SEE> a checkbox asking me to confirm i'm not uploading forbidden documents

    Examples:
      | ROLE            | COUNTRY | SEE     |  
      | buyer           | JP      | see     |
      | distributor     | JP      | see     |
      | buyer           | KR      | not see |
      | distributor     | KR      | not see |
      | buyer           | PH      | not see |
      | distributor     | PH      | not see |

  Scenario: A new user from Japan unsuccessfully tries to enroll without checking he uploaded MyNumber
    Given there is an user with role approvedDistributor created
      And There is a buyer enroll link created with approvedDistributor as originator
      And I go to enroll screen
    When I complete residence selection with country JP
      And I finish completing contact information for buyer
      And I finish selecting agreements for buyer
      And I skip upload documents
    Then I should see an error message stating I need to agree to not have uploaded MyNumber document

  Scenario Outline: A new user enrolls with a valid Email Verification Code
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I complete contact information for <ROLE> without clicking next without verification code
      And I request email verification code
      And I confirm the email sent notification alert
      And I complete contact information with the new code
      And I click next
      And I finish selecting agreements for <ROLE>
      And I check that I have not uploaded forbidden documents
      And I skip upload documents
    Then I should see a thank you message for enrolling as <ROLE>

    Examples:
    | ROLE            |
    | buyer           |
    | distributor     |

  Scenario Outline: A new user enrolls with an invalid Email Verification Code
    Given There is a <ROLE> enroll link created
      And I go to enroll screen
    When I finish completing residence selection
      And I complete contact information for <ROLE> without clicking next without verification code
      And I request email verification code
      And I confirm the email sent notification alert
      And I complete contact information with an invalid email verification code
      And I click next
    Then I should see an alert about the invalid email verification code

    Examples:
    | ROLE            |
    | buyer           |
    | distributor     |

  Scenario Outline: A new user from Vietnam unsuccessfully tries to enroll without agree that all documents are in English
     Given There is a <ROLE> enroll link created
      And I go to enroll screen
     When I complete residence selection with Vietnam as country of residence, without agreed that documents are in English
     Then I should see an error message regarding missing agreement
     
     Examples:
     | ROLE            |
     | buyer           |
     | distributor     |
