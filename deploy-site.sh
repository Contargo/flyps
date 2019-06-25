#!/bin/sh

set -e

git worktree add site/public gh-pages
make site

cd site/public
git add --all
git commit -m "Publish"
git push origin gh-pages

cd -
git worktree remove site/public
