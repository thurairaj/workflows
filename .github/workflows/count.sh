#!/bin/bash

cd ../..; npm run sonar > sonar.html
# ERROR=`grep -wc "31merror" sonar.result`
# gh api \
#             --method POST \
#             -H "Accept: application/vnd.github+json" \
#             -H "X-GitHub-Api-Version: 2022-11-28" \
#             /repos/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}/comments \
#             -f body="Error: ${ERROR}"
