import {
  GroupIcon,
  InfoIcon,
  SchoolIcon,
  TextSnippetIcon,
} from '@filigran/icon';
import { PlatformIdentifier } from '@graphql/generated';
import { ComponentType } from 'react';

export interface TrialGuideResourceCardContent {
  id: string;
  Icon: ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
  url: string;
}

export interface TrialGuideChecklistItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  readMoreUrl?: string;
}

export interface TrialGuideTabContent {
  resourceCards: TrialGuideResourceCardContent[];
  checklistItems: TrialGuideChecklistItem[];
}

export const TRIAL_GUIDE_CONTENT: Record<
  PlatformIdentifier,
  TrialGuideTabContent
> = {
  [PlatformIdentifier.Opencti]: {
    resourceCards: [
      {
        id: 'documentation',
        Icon: TextSnippetIcon,
        titleKey:
          'Service.TrialGuide.Opencti.ResourceCards.Documentation.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ResourceCards.Documentation.Description',
        url: 'https://docs.opencti.io/latest/',
      },
      {
        id: 'academy',
        Icon: SchoolIcon,
        titleKey: 'Service.TrialGuide.Opencti.ResourceCards.Academy.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ResourceCards.Academy.Description',
        url: 'https://academy.filigran.io/opencti',
      },
      {
        id: 'community',
        Icon: GroupIcon,
        titleKey: 'Service.TrialGuide.Opencti.ResourceCards.Community.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ResourceCards.Community.Description',
        url: 'https://filigran-community.slack.com/archives/CJ1PHBHF1',
      },
      {
        id: 'release-notes',
        Icon: InfoIcon,
        titleKey: 'Service.TrialGuide.Opencti.ResourceCards.ReleaseNotes.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ResourceCards.ReleaseNotes.Description',
        url: 'https://github.com/OpenCTI-Platform/opencti/releases',
      },
    ],
    checklistItems: [
      {
        id: 'activate-feeds',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ActivateFeeds.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ActivateFeeds.Description',
        readMoreUrl: 'https://docs.opencti.io/latest/usage/import/rss-feed/',
      },
      {
        id: 'configure-pir',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ConfigurePir.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ConfigurePir.Description',
        readMoreUrl:
          'https://docs.opencti.io/latest/usage/pir/?h=create+pir#pir-creation-and-how-entities-of-interest-are-determined',
      },
      {
        id: 'follow-graph',
        titleKey: 'Service.TrialGuide.Opencti.ChecklistItems.FollowGraph.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.FollowGraph.Description',
        readMoreUrl:
          'https://docs.opencti.io/latest/usage/exploring-analysis/#graph-view',
      },
      {
        id: 'create-case',
        titleKey: 'Service.TrialGuide.Opencti.ChecklistItems.CreateCase.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CreateCase.Description',
        readMoreUrl: 'https://docs.opencti.io/latest/usage/case-management/',
      },
      {
        id: 'create-fintel-report',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CreateFintelReport.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CreateFintelReport.Description',
        readMoreUrl: 'https://docs.opencti.io/latest/usage/exploring-analysis/',
      },
      {
        id: 'build-dashboard-widget',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.BuildDashboardWidget.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.BuildDashboardWidget.Description',
        readMoreUrl: 'https://docs.opencti.io/latest/usage/widgets/',
      },
      {
        id: 'connect-security-stack',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ConnectSecurityStack.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.ConnectSecurityStack.Description',
        readMoreUrl:
          'https://docs.opencti.io/latest/deployment/connectors/?h=connectors',
      },
      {
        id: 'create-no-code-playbook',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CreateNoCodePlaybook.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CreateNoCodePlaybook.Description',
        readMoreUrl:
          'https://docs.opencti.io/latest/usage/playbook-components/',
      },
      {
        id: 'check-security-coverage',
        titleKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CheckSecurityCoverage.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.CheckSecurityCoverage.Description',
        readMoreUrl:
          'https://docs.openaev.io/latest/usage/foundations/scenarios-and-simulations/',
      },
      {
        id: 'enable-agent',
        titleKey: 'Service.TrialGuide.Opencti.ChecklistItems.EnableAgent.Title',
        descriptionKey:
          'Service.TrialGuide.Opencti.ChecklistItems.EnableAgent.Description',
      },
    ],
  },
  [PlatformIdentifier.Openaev]: {
    resourceCards: [
      {
        id: 'documentation',
        Icon: TextSnippetIcon,
        titleKey:
          'Service.TrialGuide.Openaev.ResourceCards.Documentation.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ResourceCards.Documentation.Description',
        url: 'https://docs.openaev.io/latest/',
      },
      {
        id: 'academy',
        Icon: SchoolIcon,
        titleKey: 'Service.TrialGuide.Openaev.ResourceCards.Academy.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ResourceCards.Academy.Description',
        url: 'https://academy.filigran.io/course/getting-started-with-openaev',
      },
      {
        id: 'community',
        Icon: GroupIcon,
        titleKey: 'Service.TrialGuide.Openaev.ResourceCards.Community.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ResourceCards.Community.Description',
        url: 'https://filigran-community.slack.com/archives/CJ1PHBHF1',
      },
      {
        id: 'release-notes',
        Icon: InfoIcon,
        titleKey: 'Service.TrialGuide.Openaev.ResourceCards.ReleaseNotes.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ResourceCards.ReleaseNotes.Description',
        url: 'https://github.com/OpenAEV-Platform/openaev/releases',
      },
    ],
    checklistItems: [
      {
        id: 'install-starter-pack',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.InstallStarterPack.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.InstallStarterPack.Description',
        readMoreUrl:
          'https://docs.openaev.io/latest/usage/getting-started/?h=starter+pack#starter-pack',
      },
      {
        id: 'run-atomic-test',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.RunAtomicTest.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.RunAtomicTest.Description',
      },
      {
        id: 'launch-time-based-scenario',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.LaunchTimeBasedScenario.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.LaunchTimeBasedScenario.Description',
      },
      {
        id: 'run-attack-chaining-scenario',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.RunAttackChainingScenario.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.RunAttackChainingScenario.Description',
      },
      {
        id: 'drive-tabletop-exercise',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.DriveTabletopExercise.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.DriveTabletopExercise.Description',
      },
      {
        id: 'connect-threat-intel-source',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ConnectThreatIntelSource.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ConnectThreatIntelSource.Description',
      },
      {
        id: 'validate-expectations',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ValidateExpectations.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ValidateExpectations.Description',
      },
      {
        id: 'explore-results-report',
        titleKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ExploreResultsReport.Title',
        descriptionKey:
          'Service.TrialGuide.Openaev.ChecklistItems.ExploreResultsReport.Description',
      },
    ],
  },
  [PlatformIdentifier.Xtmone]: {
    resourceCards: [
      {
        id: 'documentation',
        Icon: TextSnippetIcon,
        titleKey: 'Service.TrialGuide.Xtmone.ResourceCards.Documentation.Title',
        descriptionKey:
          'Service.TrialGuide.Xtmone.ResourceCards.Documentation.Description',
        url: 'https://docs.xtmone.io/',
      },
      {
        id: 'community',
        Icon: GroupIcon,
        titleKey: 'Service.TrialGuide.Xtmone.ResourceCards.Community.Title',
        descriptionKey:
          'Service.TrialGuide.Xtmone.ResourceCards.Community.Description',
        url: 'https://filigran-community.slack.com/archives/CHNEM9NUT',
      },
    ],
    checklistItems: [
      {
        id: 'activate-ctem-assistant',
        titleKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.ActivateCtemAssistant.Title',
        descriptionKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.ActivateCtemAssistant.Description',
      },
      {
        id: 'ask-question-plain-english',
        titleKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.AskQuestionPlainEnglish.Title',
        descriptionKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.AskQuestionPlainEnglish.Description',
      },
      {
        id: 'build-threat-hunting-package',
        titleKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.BuildThreatHuntingPackage.Title',
        descriptionKey:
          'Service.TrialGuide.Xtmone.ChecklistItems.BuildThreatHuntingPackage.Description',
      },
    ],
  },
};
