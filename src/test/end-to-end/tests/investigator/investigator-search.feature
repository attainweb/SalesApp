Feature: Investigator Search

  Scenario Outline: Search for a matching refcode even if there are other User with refcodes
    Given I am the investigator
      And there is a distributor named Mick Richards
      And User Mick has a refcode with type <REF_CODE_TYPE>
      And there is a distributor named Keith Jagger
      And User Keith has a refcode with type <REF_CODE_TYPE>
    When  I login with my account
      And I search the refcode for Keith
      And I click search
    Then  I should see listed Keith Jagger in position 1

  Examples:
    | REF_CODE_TYPE |
    | buyer         |
    | distributor   |

  Scenario Outline: Search for a matching refcode will always return the user as first result 
            even if there are other matches
    Given I am the investigator
      And there is a distributor named Paul Starr
      And there is a distributor named John McCartney
      And there is a distributor named Ringo Lennon
      And User Paul has a refcode with type <REF_CODE_TYPE>
    When  I login with my account
      And I search for the name with value John
      And I search for the refcode
      And I click search
    Then  I should see listed John McCartney in position 2
      And I should see listed Paul Starr in position 1

    Examples:
      | REF_CODE_TYPE |
      | buyer         |
      | distributor   |

  Scenario Outline: Search for a field will always return the matching user as first result 

    Given I am the investigator
      And there is a distributor named Axl Rose
      And there is a distributor named Ozzy Osbourne
      And User Ozzy has set <FIELD> with value <VALUE>
    When I login with my account
      And I search for the <FIELD> with value <VALUE>
      And I click search
    Then I should see listed Ozzy Osbourne in position 1

  Examples:
    | FIELD             | VALUE         |
    | birthdate         | 1948-12-04    |
    | companyName       | Black Sabbath |
    | surname           | Osbourne      |
    | registrationDate  | 1967-01-23    |
    | phone             | 1234          |

  Scenario Outline: Search for email uses fuzzy email
    Given I am the investigator
      And there is a APPROVED distributor with email <USER_EMAIL>
      And there is a distributor named Ozzy Osbourne
    When I login with my account
      And I search for the email with value <SEARCH_EMAIL>
      And I search for the name with value Ozzy
      And I click search
    Then I should see the user with email <USER_EMAIL> in position 1

    Examples:
      | USER_EMAIL            | SEARCH_EMAIL          |
      | test@test.com         | test@test.com         |
      | test+dist1@test.com   | test@test.com         |
      | test@test.com         | test+dist1@test.com   |

  Scenario: Search for email uses fuzzy email should prioritize exact matches

    Given I am the investigator
      And there is a APPROVED distributor with email test+dist1@test.com
      And there is a APPROVED distributor with email test+dist2@test.com
    When I login with my account
      And I search for the email with value test+dist2@test.com
      And I click search
    Then I should see the user with email test+dist2@test.com in position 1
      And I should see the user with email test+dist1@test.com in position 2

  Scenario Outline: Search for various fields will always return first the user with more matches 

    Given I am the investigator
      And there is a distributor named Axl Osbourne
      And there is a distributor named Ozzy Osbourne
      And User Ozzy has set <FIELD> with value <VALUE>
    When  I login with my account
      And I search for the <FIELD> with value <VALUE>
      And I search for the surname with value Osbourne
      And I click search
    Then I should see listed Ozzy Osbourne in position 1
      And I should see listed Axl Osbourne in position 2

    Examples:
      | FIELD             | VALUE         |
      | birthdate         | 1948-12-04    |
      | companyName       | Black Sabbath |
      | name              | Ozzy          |
      | registrationDate  | 1967-01-23    |
      | phone             | 1234          |


  Scenario: Make sure search query is persisted

    Given I am the investigator
      And there is a distributor named Paul Starr
      And there is a distributor named John McCartney
    When I login with my account
      And I search for the name with value John
      And I click search
      And I click review and back
    Then  I should see listed John McCartney in position 1
      And I should see the name search field with the value John

