/* tslint:disable:variable-name */
import { model as mongooseModel, Schema } from 'mongoose';

const SkillsSchema: Schema = new Schema({
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  cluster: {
    type: String,
    enum: ['Personal', 'Leadership', 'Enterpreneuship', 'Functional'],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'SkillCategory',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SkillSubCategory',
  },
  skillTitle: {
    type: String,
    required: true,
  },
  uniqueTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  proficiencyLevel: {
    type: String,
    required: true,
  },
  certificates: {
    type: String,
    required: true,
  },
  lastApplied: {
    type: String,
    required: true,
  },
});

export const Skills = mongooseModel('SkillsSchema', SkillsSchema);