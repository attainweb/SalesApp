@unit
Feature: Refs Expiration
  Some refs should be invalid if they are used a day before they were created

  Scenario Outline: Expiring Refs should not be expired before 24 hs of creation
    Given a ref of type <TYPE> was created almost 24 hours ago
    When I get the ref state
    Then it should not be expired 

    Examples:
      | TYPE                  |
      | reset                 |
      | confirmAddress        |
 	  | confirmEmailAccount   |
      | confirmEmailChange    |
      | re-generate-one       |
      | re-generate-all       |


  Scenario Outline: Expiring Refs should be expired before 24 hs of creation
    Given a ref of type <TYPE> was created more than 24 hours ago
    When I get the ref state
    Then it should be expired 

    Examples:
      | TYPE                  |
      | reset                 |
      | confirmAddress        |
      | confirmEmailAccount   |
      | confirmEmailChange    |
	  | re-generate-one       |
      | re-generate-all       |

  Scenario Outline: Non Expiring Refs should not be expired
    Given a ref of type <TYPE> was created more than 100000000 hours ago
    When I get the ref state
    Then it should not be expired 

    Examples:
      | TYPE              |
      | partner           |
      | distributor       |
      | buyer             |
      | signup            |             
