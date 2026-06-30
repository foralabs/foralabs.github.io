FROM ruby:3.3-slim

# build-essential compiles native gem extensions (ffi, sass, etc.).
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install Jekyll globally — no Bundler, so the repo's Gemfile/Gemfile.lock
# (which may be pinned to the host's platform) is never consulted.
RUN gem install jekyll -v "~> 4.3" --no-document

# Tells Jekyll not to call Bundler.require on the project Gemfile at runtime.
ENV JEKYLL_NO_BUNDLER_REQUIRE=true

WORKDIR /srv/jekyll

EXPOSE 4000 35729

CMD ["jekyll", "serve", "--host", "0.0.0.0", "--force_polling", "--livereload"]
