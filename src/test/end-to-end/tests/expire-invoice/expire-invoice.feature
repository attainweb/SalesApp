Feature: Expire invoice

  @integration
  Scenario Outline: A <PAYMENT_OPTION> invoice that has been waiting payment for <DAYS> days, should expired
    Given today is <DATE>
      And there is an approvedBuyer with an <INVOICE> with <PAYMENT_OPTION> for <DAYS> days before
    When the app runs expiration process
      Then User approvedBuyer should receive an email with code ET204
      And the ticket is expired

    Examples:
      | DATE       | DAYS  | INVOICE         | PAYMENT_OPTION |
      # It was a Friday
      | 2016-11-11 | 4     | invoiceSentBtc  | btc            |
      | 2016-11-11 | 4     | invoiceSentBank | bank           |
      # It was a Monday
      | 2016-11-07 | 4     | invoiceSentBtc  | btc            |
      | 2016-11-07 | 6     | invoiceSentBank | bank           |

  @integration
  Scenario Outline: A <PAYMENT_OPTION> invoice that has been waiting payment for <DAYS> days, should not expired
    Given today is <DATE>
    And there is an approvedBuyer with an <INVOICE> with <PAYMENT_OPTION> for <DAYS> days before
    When the app runs expiration process
    And the ticket is not expired

    Examples:
      | DATE       | DAYS  | INVOICE         | PAYMENT_OPTION |
      # It was a Friday
      | 2016-11-11 | 3     | invoiceSentBtc  | btc            |
      | 2016-11-11 | 3     | invoiceSentBank | bank           |
      # It was a Monday
      | 2016-11-07 | 3     | invoiceSentBtc  | btc            |
      | 2016-11-07 | 5     | invoiceSentBank | bank           |

  @integration
  Scenario Outline: An invoice that has received the 0 or more reception confirmations, should not expire
    Given there is an approvedBuyer with an invoiceSentBtc with btc for 4 days before
      And that ticket receives the <NUM_CONFIRMATIONS>-confirmation notification
    When the app runs expiration process
      Then the ticket is not expired

    Examples:
    | NUM_CONFIRMATIONS |
    | 0                 |
    | 1                 |
