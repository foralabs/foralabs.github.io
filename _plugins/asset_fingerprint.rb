# Content-hashed asset filenames, so a redeploy never serves a stale CSS/JS
# file from a browser or CDN cache.
#
# Each .css/.js static file is written to disk with a short hash of its
# contents folded into the name (main.css -> main-ab12cd34ef56.css). The URL
# only changes when the file's bytes change, so unchanged assets stay cached
# across deploys while changed ones bust automatically.
#
# Reference assets through the `fingerprint` Liquid filter:
#   {{ '/assets/css/main.css' | fingerprint | relative_url }}
require "digest"

module Jekyll
  # A static file that carries a content hash in its *output* name only. The
  # source path is left untouched so the original file is still read from disk.
  class FingerprintedStaticFile < StaticFile
    def initialize(site, base, dir, name, digest)
      super(site, base, dir, name)
      @digest = digest
    end

    def destination(dest)
      ext  = File.extname(@name)
      stem = @name[0...(@name.length - ext.length)]
      File.join(dest, @dir, "#{stem}-#{@digest}#{ext}")
    end
  end

  class AssetFingerprint < Generator
    safe true
    # Run late, once all static files have been collected.
    priority :low

    # Only these asset types are fingerprinted; images/favicons keep stable
    # names since they're referenced from many places and rarely change.
    EXTENSIONS = %w[.css .js].freeze

    def generate(site)
      manifest = {}

      site.static_files.map! do |sf|
        next sf unless EXTENSIONS.include?(File.extname(sf.name))

        digest = Digest::MD5.hexdigest(File.read(sf.path))[0, 12]
        base   = sf.instance_variable_get(:@base)
        dir    = sf.instance_variable_get(:@dir)
        name   = sf.instance_variable_get(:@name)

        fp = FingerprintedStaticFile.new(site, base, dir, name, digest)
        manifest[File.join(dir, name)] = fp.destination("")
        fp
      end

      # Consumed by the `fingerprint` filter during page rendering.
      site.config["asset_manifest"] = manifest
    end
  end
end

module FingerprintFilter
  # Map an original site-absolute asset path to its hashed output path.
  # Passes the path through unchanged if it wasn't fingerprinted.
  def fingerprint(path)
    manifest = @context.registers[:site].config["asset_manifest"] || {}
    manifest[path] || path
  end
end

Liquid::Template.register_filter(FingerprintFilter)
