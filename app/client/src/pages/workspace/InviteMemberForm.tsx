import React, { useState } from "react";
import styled from "styled-components";
import { Button, Input, toast } from "@appsmith/ads";
import Api from "api/Api";

interface InviteMemberFormProps {
  workspaceId: string;
}

interface InvitationResponse {
  responseMeta?: { status?: number };
  data?: {
    id?: string;
    workspaceId?: string;
    email?: string;
    errors?: string[];
  };
}

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  max-width: 420px;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

async function inviteMember(
  workspaceId: string,
  email: string,
): Promise<InvitationResponse> {
  return Api.post<InvitationResponse>("v1/invitations", { workspaceId, email });
}

export const InviteMemberForm: React.FC<InviteMemberFormProps> = ({
  workspaceId,
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const response = await inviteMember(workspaceId, email.trim());
      const status = response.responseMeta?.status ?? 0;
      if (status >= 200 && status < 300) {
        toast.show("Invitation sent!", { kind: "success" });
        setEmail("");
      } else {
        toast.show("Failed to send invitation.", { kind: "error" });
      }
    } catch (err) {
      toast.show("Failed to send invitation.", { kind: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormWrapper data-testid="t--invite-member-form">
      <Row>
        <Input
          aria-label="Email"
          data-testid="t--invite-member-email"
          isDisabled={submitting}
          onChange={(value: string) => setEmail(value)}
          placeholder="teammate@example.com"
          size="md"
          type="email"
          value={email}
        />
        <Button
          data-testid="t--invite-member-submit"
          isDisabled={!email || submitting}
          isLoading={submitting}
          kind="primary"
          onClick={handleSubmit}
          size="md"
        >
          Send invite
        </Button>
      </Row>
    </FormWrapper>
  );
};

export default InviteMemberForm;
