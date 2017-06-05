Feature: Compliance officers review user notes:
  All compliance officers should be able to review
  webchecks and calls that have been added to users
  by any other officer in the past.

  Compliance officers add user notes:
  All compliance officers should be able to add
  webChecks and calls. Only customer service officers
  can add customer service notes.

  Scenario Outline: Officer reviews an user with notes
    Given I am the <COMPLIANCE_OFFICER>
      And I login with my account
      And there is an user with role notApprovedBuyer created
      And the notApprovedBuyer has the following notes assigned:
      | webCheck     | call         | customerServiceNote |
      | first check  | first call   | first cs note       |
      | second check | second call  | second cs note      |
    When I review the notApprovedBuyer
    Then I see the notes assigned to the notApprovedBuyer

    Examples:
    | COMPLIANCE_OFFICER |
    | customerService    |
    | compliance         |
    | chiefcompliance    |



  Scenario Outline: Officer adds notes to user
    Given I am the <COMPLIANCE_OFFICER>
      And I login with my account
      And there is an user with role notApprovedBuyer created
    When I review the notApprovedBuyer
      And I add <NOTE> as a note to the user
    Then I see the <NOTE> note I wrote to the notApprovedBuyer

    Examples:
    | COMPLIANCE_OFFICER |  NOTE                |
    | customerService    |  customerServiceNote |
    | compliance         |  webCheck            |
    | compliance         |  call                |
