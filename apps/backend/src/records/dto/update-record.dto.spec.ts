import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateRecordDto } from './update-record.dto';

async function validateRequest(request: Record<string, unknown>) {
  return validate(plainToInstance(UpdateRecordDto, request), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateRecordDto', () => {
  it('accepts each editable field, including false and null', async () => {
    await expect(
      validateRequest({ actorUserId: 'user-1', comment: 'Updated comment' }),
    ).resolves.toHaveLength(0);
    await expect(
      validateRequest({ actorUserId: 'user-1', done: false }),
    ).resolves.toHaveLength(0);
    await expect(
      validateRequest({ actorUserId: 'user-1', denyCode: null }),
    ).resolves.toHaveLength(0);
  });

  it('rejects a request without an editable field', async () => {
    const errors = await validateRequest({ actorUserId: 'user-1' });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toMatchObject({
      hasEditableRecordChange:
        'At least one of comment, denyCode, or done must be provided.',
    });
  });

  it('rejects an empty actor user ID', async () => {
    const errors = await validateRequest({ actorUserId: '', done: true });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('actorUserId');
  });

  it('rejects comments longer than 255 characters', async () => {
    const errors = await validateRequest({
      actorUserId: 'user-1',
      comment: 'a'.repeat(256),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('comment');
  });

  it('rejects unknown properties', async () => {
    const errors = await validateRequest({
      actorUserId: 'user-1',
      done: true,
      payer: 'Not allowed',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('payer');
  });
});
