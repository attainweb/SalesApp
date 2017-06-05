@unit @acceptance
Feature: Sales Predictor
  The sales predictor is used to compare the invoiced and paid amount
  with the configured allowed maximum and threshold and to allow or 
  disallow sales.

  Background:
    Given the following options:
    | OPTION                | VALUE |
    | totalAmountAvailable  | 1000  |
    | overCapacityTolerance | 0.2   |

  Scenario: Configuring the Sales Predictor
    When a sales predictor is created with the given options
    Then the sales predictor should have the following properties:
    | PROPERTY                   | VALUE |
    | totalAmountAvailable       | 1000  |
    | overCapacityTolerance      | 0.2   |
    | overCapacityToleranceValue | 200   |
    | totalAmountAvailableCap    | 1200  |
    | amountInvoicedOrPaid       | 0     |
    | amountPaid                 | 0     |

  Scenario: Allow Sales when they are within the Limit and Tolerance
    And the following options:
    | OPTION               | VALUE |
    | amountInvoicedOrPaid | 980   |
    | amountPaid           | 800   |
    When a sales predictor is created with the given options
    Then the sales goal should not have been reached
    And the sales predictor should behave as follows:
    | SALE | ALLOW |
    | 20   | true  |
    | 21   | true  |
    | 60   | true  |
    | 61   | false |
    | 221  | false |
    
  Scenario: Deny Sales when Hard Limit is Reached
    And the following options:
    | OPTION               | VALUE |
    | amountInvoicedOrPaid | 1000  |
    | amountPaid           | 1000  | # paid == total vailable -> sales goal reached!
    When a sales predictor is created with the given options
    Then the sales goal should have been reached
    And the sales predictor should behave as follows:
    | SALE | ALLOW  |
    | 1    | false  |
    | 2    | false  |
    
  Scenario: Reduced Overcapacity when Approaching End of Sale
    And the following options:
    | OPTION               | VALUE |
    | amountInvoicedOrPaid | 1000  |
    | amountPaid           | 0     |
    When a sales predictor is created with the given options
    Then the sales goal should not have been reached
    And the sales predictor should behave as follows:
    | SALE | ALLOW  |
    | 60   | true   |
    | 61   | false  | # 1000 * 0,2 * 0,3 (reduced over capacity) == max 60 sale!
