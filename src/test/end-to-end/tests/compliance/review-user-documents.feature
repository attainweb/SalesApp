Feature: Review users documents
  
  Scenario: As CO I should be able to delete pictures of an enrolling user
   that was not yet been approved
    Given I am the compliance
     And I login with my account
     And there is an user with role notApprovedBuyer created
     And I review the notApprovedBuyer
     And an image was uploaded for that notApprovedBuyer
     And I select the image
    When I delete the image
    Then I don't see the image anymore
  
  Scenario: As CO I should not be able to delete pictures I or another
   uploaded in a previous approval stage
    Given I am the compliance
     And I login with my account
     And there is an user with role notApprovedBuyer created
     And I review the notApprovedBuyer
     And in a previous approval stage an image was uploaded for that notApprovedBuyer
    When I select the image
    Then I can't delete the image
