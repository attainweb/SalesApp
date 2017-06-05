Feature: I want to be able to see Sales Overview Screen in order to check sale status

    Scenario Outline: View sales status screen
        Given I am the <ROLE>
          And The sales is started
        When I login with my account
          And I navigate to sale-overview
        Then I can see salesStatus as started 
          And I can see the ProductCounter values

  Examples:

  | ROLE         |
  | admin        |
  | sysop        |