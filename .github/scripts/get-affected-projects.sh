#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Detecting affected projects...${NC}"

# Get the branch/ref info
BRANCH="${GITHUB_REF_NAME:-}"
EVENT_NAME="${GITHUB_EVENT_NAME:-}"
BASE_SHA="${GITHUB_BASE_REF:-origin/main}"

echo "Branch: $BRANCH"
echo "Event: $EVENT_NAME"
echo "Base: $BASE_SHA"

# All available projects
ALL_PROJECTS='[
  {"image":"portal-front","dockerfile":"apps/portal-front/Dockerfile"},
  {"image":"portal-api","dockerfile":"apps/portal-api/Dockerfile"},
  {"image":"portal-e2e-tests","dockerfile":"apps/portal-e2e-tests/Dockerfile"}
]'

# Check if we should build all projects (main, development, tags)
if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "development" ]] || [[ "$GITHUB_REF" == refs/tags/* ]]; then
  echo -e "${GREEN}✅ Building ALL projects (branch: $BRANCH)${NC}"
  echo "all=true" >> $GITHUB_OUTPUT
  echo "projects=$ALL_PROJECTS" >> $GITHUB_OUTPUT
  echo "projects-json<<EOF" >> $GITHUB_OUTPUT
  echo "$ALL_PROJECTS" >> $GITHUB_OUTPUT
  echo "EOF" >> $GITHUB_OUTPUT
  exit 0
fi

# For PRs, detect affected projects
if [[ "$EVENT_NAME" == "pull_request" ]]; then
  echo -e "${YELLOW}📊 Analyzing affected projects for PR...${NC}"

  # Fetch base branch for comparison
  git fetch origin "$BASE_SHA" --depth=1 || true

  # Get affected projects using nx
  AFFECTED_APPS=$(npx nx show projects --affected --base=origin/$BASE_SHA --type=app 2>/dev/null || echo "")

  if [[ -z "$AFFECTED_APPS" ]]; then
    echo -e "${YELLOW}⚠️  No affected projects detected, building all projects as safety measure${NC}"
    echo "all=true" >> $GITHUB_OUTPUT
    echo "projects=$ALL_PROJECTS" >> $GITHUB_OUTPUT
    echo "projects-json<<EOF" >> $GITHUB_OUTPUT
    echo "$ALL_PROJECTS" >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT
    exit 0
  fi

  echo -e "${GREEN}Affected apps:${NC}"
  echo "$AFFECTED_APPS"

  # Build JSON array for matrix
  PROJECTS_JSON="["
  FIRST=true

  while IFS= read -r app; do
    # Map app name to docker image config
    case "$app" in
      "portal-front")
        if [ "$FIRST" = true ]; then
          FIRST=false
        else
          PROJECTS_JSON+=","
        fi
        PROJECTS_JSON+='{"image":"portal-front","dockerfile":"apps/portal-front/Dockerfile"}'
        ;;
      "portal-api")
        if [ "$FIRST" = true ]; then
          FIRST=false
        else
          PROJECTS_JSON+=","
        fi
        PROJECTS_JSON+='{"image":"portal-api","dockerfile":"apps/portal-api/Dockerfile"}'
        ;;
      "portal-e2e-tests")
        if [ "$FIRST" = true ]; then
          FIRST=false
        else
          PROJECTS_JSON+=","
        fi
        PROJECTS_JSON+='{"image":"portal-e2e-tests","dockerfile":"apps/portal-e2e-tests/Dockerfile"}'
        ;;
    esac
  done <<< "$AFFECTED_APPS"

  PROJECTS_JSON+="]"

  # If no valid projects found, build all
  if [[ "$PROJECTS_JSON" == "[]" ]]; then
    echo -e "${YELLOW}⚠️  No matching projects found, building all as safety measure${NC}"
    echo "all=true" >> $GITHUB_OUTPUT
    echo "projects=$ALL_PROJECTS" >> $GITHUB_OUTPUT
    echo "projects-json<<EOF" >> $GITHUB_OUTPUT
    echo "$ALL_PROJECTS" >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT
  else
    echo -e "${GREEN}✅ Building affected projects only${NC}"
    echo "all=false" >> $GITHUB_OUTPUT
    echo "projects=$PROJECTS_JSON" >> $GITHUB_OUTPUT
    echo "projects-json<<EOF" >> $GITHUB_OUTPUT
    echo "$PROJECTS_JSON" >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT
  fi

  echo "Projects matrix: $PROJECTS_JSON"
else
  # For other events, build all
  echo -e "${GREEN}✅ Building ALL projects (event: $EVENT_NAME)${NC}"
  echo "all=true" >> $GITHUB_OUTPUT
  echo "projects=$ALL_PROJECTS" >> $GITHUB_OUTPUT
  echo "projects-json<<EOF" >> $GITHUB_OUTPUT
  echo "$ALL_PROJECTS" >> $GITHUB_OUTPUT
  echo "EOF" >> $GITHUB_OUTPUT
fi
