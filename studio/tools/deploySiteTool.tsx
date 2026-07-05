import {useState} from 'react';
import {Button, Card, Flex, Stack, Text} from '@sanity/ui';
import {RocketIcon} from '@sanity/icons';
import type {Tool} from 'sanity';

type Status = 'idle' | 'loading' | 'success' | 'error';

function DeploySiteTool() {
  const [status, setStatus] = useState<Status>('idle');
  const hookUrl = import.meta.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_URL as string | undefined;

  async function handleDeploy() {
    if (!hookUrl) return;
    setStatus('loading');
    try {
      const res = await fetch(hookUrl, {method: 'POST'});
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card padding={4} height="fill">
      <Stack space={4} style={{maxWidth: 480}}>
        <Text size={2} weight="semibold">
          Mettre le site en ligne
        </Text>
        <Text size={1} muted>
          Publiez vos modifications dans Sanity comme d&apos;habitude (une ou plusieurs pages), puis
          cliquez ici quand vous êtes prêt·e à les rendre visibles sur tahitiguestboat.com. Le site
          va se reconstruire, comptez 1 à 2 minutes.
        </Text>
        {!hookUrl && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>
              URL de déploiement non configurée. Contactez l&apos;administrateur du site.
            </Text>
          </Card>
        )}
        <Flex align="center" gap={3}>
          <Button
            icon={RocketIcon}
            text={status === 'loading' ? 'Déploiement en cours…' : 'Déployer le site'}
            tone="primary"
            disabled={!hookUrl || status === 'loading'}
            onClick={handleDeploy}
          />
          {status === 'success' && (
            <Text size={1} tone="positive">
              Déploiement lancé
            </Text>
          )}
          {status === 'error' && (
            <Text size={1} tone="critical">
              Échec du déclenchement, réessayez
            </Text>
          )}
        </Flex>
      </Stack>
    </Card>
  );
}

export const deploySiteTool: Tool = {
  name: 'deploy-site',
  title: 'Déployer',
  icon: RocketIcon,
  component: DeploySiteTool,
};
