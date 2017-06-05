import Logger from '/imports/server/lib/logger';
import { requiredComplianceLevel, isCompliant } from '/imports/server/users/compliance-level';

// to do: move this methods to '/imports/server/users/compliance_level'

export const buyerApplyForRequiredComplianceLevel = (buyerId) => {
  Logger.info('[buyerApplyForRequiredComplianceLevel] - starting');
  const buyer = Meteor.users.findOne(buyerId);
  const requiredLevel = requiredComplianceLevel(buyer);

  buyer.updateFields({
    'personalInformation.applyingForComplianceLevel': requiredLevel,
    'personalInformation.status': 'PENDING',
  });
  Logger.info('[buyerApplyForRequiredComplianceLevel] - ok! ', 'buyer: ', buyerId);
};

export const buyerHasRequiredComplianceLevel = (buyerId) => {
  return isCompliant(Meteor.users.findOne(buyerId));
};
