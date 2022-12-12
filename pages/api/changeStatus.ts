import { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { User } from '../../db/User';
import dbConnect from '../../lib/mongoose';
import { AuthOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { course } = JSON.parse(req.body);
  const session = await unstable_getServerSession(req, res, AuthOptions);

  if (!session) return res.json({ error: 'No user' });

  await dbConnect();

  const user = await User.findOne({ name: session.user.name });

  if (!user) return res.json({ error: 'No user' });

  if (user.courses.includes(course)) {
    await user.updateOne({ $pull: { courses: course } });
  } else {
    await user.updateOne({ $addToSet: { courses: course } });
  }

  return res.json({ message: 'Updated' });
}
