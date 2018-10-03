import { InterviewAvailabilityCalender } from './../../../models/InterviewAvailabilityCalender';
import { Experience } from './../../../models/Experience';
import { EmployeeProjects } from './../../../models/EmployeeProjects';

import { IQueryParams } from './Query-params.interface';

export async function firstQuery(
  params: IQueryParams,
  role: 'PM' | 'Consultant',
) {
  // console.log('> running f-q');
  const availabilityRespRaw = await InterviewAvailabilityCalender.aggregate([
    {
      $match: {
        startTime: { $gte: params.startTime },
        endTime: { $lte: params.endTime },
        booked: false,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'userDetails.role': role } },
    {
      $group: { _id: '$userId', length: { $sum: 1 } },
    },
    { $sort: { length: -1 } },
    { $limit: 100 },
    { $skip: 0 },
    { $group: { _id: 'allIds', ids: { $push: '$_id' } } },
  ]);

  const availabilityResp = availabilityRespRaw[0]
    ? availabilityRespRaw[0].ids
    : [];

  const usersWithSameTopic = await EmployeeProjects.find({
    userId: { $in: availabilityResp },
    topic: params.topic,
  }).distinct('userId');

  const usersWithSameIndustry = await Experience.find({
    userId: { $in: usersWithSameTopic },
    companyIndustryLine: params.industry,
  }).distinct('userId');

  const result = {
    // return set
    firstQResult: new Set(usersWithSameIndustry), // ['userId', ...]
    availabilityResp, // for using in next query
  };

  // console.log('> f-q result', result);

  return result;
}
